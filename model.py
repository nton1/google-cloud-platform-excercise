# Copyright 2013 Google, Inc
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

from collections import Counter
from google.appengine.ext import ndb


class Simulation(ndb.Model):
    date_simulation = ndb.DateTimeProperty(auto_now=False, auto_now_add=True)
    time_execution = ndb.FloatProperty()


def create_simulation():
    # timestamp = models.DateField(auto_now=False, auto_now_add=True)
    simulation = Simulation()
    # print simulation.date_simulation
    simulation.put()
    return simulation


def all_simulations():
    return Simulation.query()


class Batch(ndb.Model):
    simulation = ndb.KeyProperty(kind=Simulation)
    date_batch = ndb.DateTimeProperty(auto_now=False, auto_now_add=True)


def create_batch(simulation):
    batch = Batch()
    batch.simulation = simulation.key
    batch.put()
    return batch


def all_batches():
    return Batch.query()


class Statistics(ndb.Model):
    simulation = ndb.KeyProperty(kind=Simulation)
    amount_different_numbers = ndb.IntegerProperty()
    percent_0_50 = ndb.JsonProperty()
    extracted_number_percent = ndb.JsonProperty()
    time_execution = ndb.FloatProperty()

def create_statistics(simulation):
    statistics = Statistics()
    statistics.simulation = simulation.key
    statistics.put()
    return statistics

def all_statistics():
    return Statistics.query()


# def get_statistics(simulationid):
#     simulation = Simulation.get_by_id(simulationid)
#     statistics = Statistics.query(Statistics.simulation == simulation.key).fetch()
#     return statistics

def get_statistics(simulationid):
    simulation = Simulation.get_by_id(simulationid)
    statistics = Statistics.query(Statistics.simulation == simulation.key).fetch()
    return statistics

def generate_statistics(simulation):

    statistics = create_statistics(simulation)

    array_batch = []
    query1 = Batch.query(Batch.simulation == simulation.key).fetch()
    for instance0 in query1:
        array_batch.append(instance0.key)



    query_result = NumbersExtracted.query(NumbersExtracted.batch.IN(array_batch)).order(
        ndb.GenericProperty('extracted_number'))

    query_set = query_result.fetch()
    query_set_count = query_result.count()

    # All value with duplicated value
    set_of_field = [data.extracted_number for data in query_set]

    l = set_of_field
    percent = [(i, Counter(l)[i] / float(len(l)) * 100.0) for i in Counter(l)]

    max_value_extracted = []
    first_value = 0
    second_value = 0
    for element in percent:
        print element
        if element[1] >= second_value:
            if element[1] > second_value:
                max_value_extracted = []
                max_value_extracted.append(element)
                first_value = element[0]
                second_value = element[1]
            if (element[1] == second_value) & (element[0] != first_value):
                max_value_extracted.append(element)
                second_value = element[1]

    print ""
    print "-----max percent values extracted--------"
    for item in max_value_extracted:
        print item

    # All value without duplicated value
    unique_results = []
    for obj in query_set:
        if obj.extracted_number not in unique_results:
            unique_results.append(obj.extracted_number)



    # SalvareDati
    statistics.simulation = simulation.key
    statistics.amount_different_numbers = len(unique_results) - 1
    statistics.percent_0_50 = percent
    statistics.extracted_number_percent = max_value_extracted
    statistics.time_execution = simulation.time_execution
    statistics.put()



    # id simulazione
    # quanti numeri differenti -> unique_results
    # % numeri stratti da 0 a 50 -> max_value_extracted

    # tempo di simulazione -> simulation.time_execution

    risultato = Statistics.query(Statistics.simulation == simulation.key).fetch()
    #get_statistics(simulation)
    print ""
    print "All unique values"
    print len(unique_results) - 1
    print ""
    # print "All value with duplicated value"
    # print len(query_set)
    # print query_set_count






class NumbersExtracted(ndb.Model):
    batch = ndb.KeyProperty(kind=Batch)
    extracted_number = ndb.IntegerProperty()
    date_extraction = ndb.DateTimeProperty(auto_now=False, auto_now_add=True)


def save_number(number_extracted, batch):
    number = NumbersExtracted()
    number.batch = batch.key
    number.extracted_number = number_extracted
    number.put()
    return number

def delete_all_simulations():
    ndb.delete_multi(
        Statistics.query().fetch(keys_only=True)
    )
    ndb.delete_multi(
        NumbersExtracted.query().fetch(keys_only=True)
    )
    ndb.delete_multi(
        Batch.query().fetch(keys_only=True)
    )
    ndb.delete_multi(
        Simulation.query().fetch(keys_only=True)
    )

    print "Done"


def all_numbers_extracted():
    return NumbersExtracted.query()

def get_different_numbers(simulation):
    # query1 = Account.query()  # Retrieve all Account entitites
    # query2 = query1.filter(Account.userid >= 40)  # Filter on userid >= 40
    # query3 = query2.filter(Account.userid < 50)  # Filter on userid < 50 too
    # query1 = Contact.query(Contact.addresses.city == 'Amsterdam',  # Beware!
    #                       Contact.addresses.street == 'Spear St')
    # query = Article.query(Article.tags.IN(['python', 'ruby', 'php']))
    # user = UserProfile.query(UserProfile.tasks == ndb.Key(TaskList, 7))

    # batches = Batch.query(ancestor=simulation._entity_key).fetch()
     array_batch = []
     query1 = Batch.query(Batch.simulation == simulation.key).fetch()
     for instance0 in query1:
         array_batch.append(instance0.key)

     # pippo= ndb.gql("SELECT DISTINCT extracted_number FROM NumbersExtracted AS numeroestratto")
     #Article.query(projection=[Article.author], group_by=[Article.author])
     #Article.query(projection=[Article.author], distinct=True)
     # query_result2 = NumbersExtracted.query(projection=[NumbersExtracted.extracted_number]
     #                               ,distinct=True).order(ndb.GenericProperty('extracted_number')).fetch()
     # query_result3 = query_result2.fetch()

     #query_result = NumbersExtracted.query(NumbersExtracted.batch.IN(array_batch),projection=[NumbersExtracted.extracted_number], distinct=True).fetch()
     #query_result2 = NumbersExtracted.query(NumbersExtracted.batch.IN(array_batch),
     #                                      projection=[NumbersExtracted.extracted_number],
     #                                      group_by=[NumbersExtracted.extracted_number]).fetch()
     #query_result1 = NumbersExtracted.query(NumbersExtracted.batch.IN(array_batch),
     #                                 projection=[NumbersExtracted.extracted_number]
     #                                 ,distinct=True).order(ndb.GenericProperty('extracted_number')).fetch()

     query_result = NumbersExtracted.query(NumbersExtracted.batch.IN(array_batch)).order(ndb.GenericProperty('extracted_number'))
     #query_result_different = ndb.gql("SELECT extracted_number FROM NumbersExtracted")
     query_set = query_result.fetch()
     query_set_count = query_result.count()


     # All value with duplicated value
     set_of_field = [data.extracted_number for data in query_set]


     l = set_of_field
     percent = [(i, Counter(l)[i] / float(len(l)) * 100.0) for i in Counter(l)]

     max_value_extracted = []
     first_value = 0
     second_value = 0
     for element in percent:
         print element
         if element[1] >= second_value:
                 if element[1] > second_value:
                    max_value_extracted = []
                    max_value_extracted.append(element)
                    first_value = element[0]
                    second_value = element[1]
                 if (element[1] == second_value) & (element[0] != first_value):
                    max_value_extracted.append(element)
                    second_value = element[1]

     print ""
     print "-----max percent values extracted--------"
     for item in max_value_extracted:
         print item


     # All value without duplicated value
     unique_results = []
     for obj in query_set:
        if obj.extracted_number not in unique_results:
            unique_results.append(obj.extracted_number)

     #Salvare
     # id simulazione
     # quanti numeri differenti -> unique_results
     # % numeri stratti da 0 a 50 -> max_value_extracted

     # tempo di simulazione -> simulation.time_execution



     print ""
     print "All unique values"
     print len(unique_results)-1
     print ""









